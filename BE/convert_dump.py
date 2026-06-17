import re
import sys

def convert_sql_dump(input_path, output_path):
    """
    Converts a Redshift/PostgreSQL 8.0 SQL dump to a standard PostgreSQL dump
    by commenting out incompatible statements, converting specific syntaxes,
    and populating empty performance tables.
    """
    print(f"Reading from: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Pass 1: Parse all non-empty table schemas to copy columns for empty performance tables
    table_bodies = {}
    current_table_name = None
    current_body = []
    is_parsing_table = False
    
    for line in lines:
        match = re.match(r'(?i)^\s*CREATE\s+TABLE\s+(?:\w+)\.(\w+)\s*\(', line)
        if match:
            current_table_name = match.group(1)
            current_body = []
            is_parsing_table = True
            # FIX: KHÔNG 'continue' ở đây vì có thể có định nghĩa cột ngay trên dòng này 
            # hoặc cần giữ nguyên logic cấu trúc dòng tiếp theo.
            continue
            
        if is_parsing_table:
            if re.match(r'^\s*\);\s*$', line):
                is_parsing_table = False
                body_str = "".join(current_body).strip()
                if body_str:
                    table_bodies[current_table_name] = current_body
                current_table_name = None
            else:
                current_body.append(line)

    print(f"Found column definitions for {len(table_bodies)} tables.")

    # Pass 2: Write converted lines
    converted_lines = []
    
    # Regex patterns
    cast_pattern = re.compile(r'(?i)^\s*CREATE\s+CAST\s+')
    owner_pattern = re.compile(r'(?i)^\s*ALTER\s+.*\s+OWNER\s+TO\s+.*;')
    restrict_pattern = re.compile(r'(?i)^\s*\\restrict\b')
    
    # 4. Matches identity column default definitions
    identity_pattern = re.compile(r"(?i)DEFAULT\s+(?:\"identity\"|default_identity)\(\d+,\s*0,\s*(?:\(\s*'1,1'::[^)]+\s*\)::text|'1,1'::(?:text|character varying|varchar)?)\)")
    
    # Matches getdate() and old now syntax
    getdate_pattern = re.compile(r'(?i)\bgetdate\(\)')
    now_timestamp_pattern = re.compile(r"(?i)\('now'::(?:text|character varying|varchar)\)::timestamp\s*(?:with|without)\s+time\s+zone")

    # NEW PATTERN: Phát hiện cột ID kiểu bigint hoặc integer đi kèm identity để ép sang BIGSERIAL/SERIAL
    bigint_identity_pattern = re.compile(r'(?i)\b(id)\s+bigint\s+DEFAULT\s+(?:\"identity\"|default_identity)\([^)]+\)')
    int_identity_pattern = re.compile(r'(?i)\b(id)\s+integer\s+DEFAULT\s+(?:\"identity\"|default_identity)\([^)]+\)')

    idx = 0
    n = len(lines)
    while idx < n:
        line = lines[idx]
        
        # Check for CREATE TABLE
        table_match = re.match(r'(?i)^\s*CREATE\s+TABLE\s+(\w+)\.(\w+)\s*\(', line)
        if table_match:
            schema = table_match.group(1)
            table_name = table_match.group(2)
            
            # Check if the table is empty
            next_idx = idx + 1
            is_empty = False
            while next_idx < n and not lines[next_idx].strip():
                next_idx += 1
            if next_idx < n and re.match(r'^\s*\);\s*$', lines[next_idx]):
                is_empty = True
                
            if is_empty:
                if table_name in table_bodies:
                    print(f"Populating empty table {schema}.{table_name} with columns from template.")
                    converted_lines.append(f"DROP TABLE IF EXISTS {schema}.{table_name} CASCADE;\n")
                    converted_lines.append(line)
                    
                    # Convert default values inside the copied body
                    for body_line in table_bodies[table_name]:
                        # Ưu tiên convert cột id sang BIGSERIAL / SERIAL trước
                        if bigint_identity_pattern.search(body_line):
                            body_line = bigint_identity_pattern.sub(r"\1 BIGSERIAL", body_line)
                        elif int_identity_pattern.search(body_line):
                            body_line = int_identity_pattern.sub(r"\1 SERIAL", body_line)
                        elif identity_pattern.search(body_line):
                            body_line = identity_pattern.sub("GENERATED ALWAYS AS IDENTITY", body_line)
                            
                        if now_timestamp_pattern.search(body_line):
                            body_line = now_timestamp_pattern.sub("CURRENT_TIMESTAMP", body_line)
                        if getdate_pattern.search(body_line):
                            body_line = getdate_pattern.sub("CURRENT_TIMESTAMP", body_line)
                        converted_lines.append(body_line)
                        
                    converted_lines.append(");\n")
                    idx = next_idx + 1
                    continue
                else:
                    print(f"Warning: Empty table {schema}.{table_name} found but no template table found.")
            
            # Non-empty table: prepend drop table cascade
            converted_lines.append(f"DROP TABLE IF EXISTS {schema}.{table_name} CASCADE;\n")
            
        # Check for CREATE VIEW
        view_match = re.match(r'(?i)^\s*CREATE\s+VIEW\s+(\w+)\.(\w+)', line)
        if view_match:
            schema = view_match.group(1)
            view_name = view_match.group(2)
            converted_lines.append(f"DROP VIEW IF EXISTS {schema}.{view_name} CASCADE;\n")
            
        # Check for CREATE SCHEMA
        schema_match = re.match(r'(?i)^\s*CREATE\s+SCHEMA\s+(\w+);', line)
        if schema_match:
            schema_name = schema_match.group(1)
            converted_lines.append(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE;\n")
            
        # Comment out CREATE CAST lines
        if cast_pattern.match(line):
            converted_lines.append(f"-- {line}")
            idx += 1
            continue
            
        # Comment out ALTER ... OWNER TO lines
        if owner_pattern.match(line):
            converted_lines.append(f"-- {line}")
            idx += 1
            continue
            
        # Comment out \restrict lines
        if restrict_pattern.match(line):
            converted_lines.append(f"-- {line}")
            idx += 1
            continue
            
        # --- ĐOẠN SỬA ĐỔI CHÍNH: CONVERT IDENTITY SANG SERIAL/BIGSERIAL ---
        if bigint_identity_pattern.search(line):
            line = bigint_identity_pattern.sub(r"\1 BIGSERIAL", line)
        elif int_identity_pattern.search(line):
            line = int_identity_pattern.sub(r"\1 SERIAL", line)
        elif identity_pattern.search(line):
            # Nếu không phải cột ID mà là cột khác có identity, dùng cú pháp chuẩn hóa an toàn nhất
            line = identity_pattern.sub("GENERATED BY DEFAULT AS IDENTITY", line)
            
        # Convert ('now'::text)::timestamp... syntax to CURRENT_TIMESTAMP
        if now_timestamp_pattern.search(line):
            line = now_timestamp_pattern.sub("CURRENT_TIMESTAMP", line)
            
        # Convert getdate() to CURRENT_TIMESTAMP
        if getdate_pattern.search(line):
            line = getdate_pattern.sub("CURRENT_TIMESTAMP", line)
            
        converted_lines.append(line)
        idx += 1

    print(f"Writing converted SQL to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(converted_lines)
    print("Conversion completed successfully!")

if __name__ == '__main__':
    input_file = '/home/dev_ntd/Know_Block/Know_Ledge_Block/BE/point_localhost-2026_05_25_11_52_42-dump.sql'
    output_file = '/home/dev_ntd/Know_Block/Know_Ledge_Block/BE/point_localhost-2026_05_25_11_52_42-postgres.sql'
    convert_sql_dump(input_file, output_file)
