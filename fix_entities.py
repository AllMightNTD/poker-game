import os
import glob
import re

entity_files = glob.glob('BE/src/v1/entities/*.ts')

for f in entity_files:
    with open(f, 'r') as file:
        content = file.read()
    
    # 1. Chuẩn hóa các trường đã có (loại bỏ config dư thừa)
    content = re.sub(
        r'@CreateDateColumn\(\{[^}]*\}\)\s+created_at:\s*Date;',
        r'@CreateDateColumn()\n  created_at: Date;',
        content
    )
    content = re.sub(
        r'@UpdateDateColumn\(\{[^}]*\}\)\s+updated_at:\s*Date;',
        r'@UpdateDateColumn()\n  updated_at: Date;',
        content
    )
    
    # Check if created_at and updated_at exist
    has_created = 'created_at: Date;' in content
    has_updated = 'updated_at: Date;' in content
    
    # Import CreateDateColumn and UpdateDateColumn if needed
    if not has_created or not has_updated:
        # We need to add them. Find the end of the class.
        class_end_match = re.search(r'}\s*$', content)
        if class_end_match:
            added_fields = ""
            if not has_created:
                added_fields += "\n  @CreateDateColumn()\n  created_at: Date;\n"
            if not has_updated:
                added_fields += "\n  @UpdateDateColumn()\n  updated_at: Date;\n"
            
            content = content[:class_end_match.start()] + added_fields + content[class_end_match.start():]
            
            # Ensure imports exist
            typeorm_import_match = re.search(r"import\s+{([^}]*)}\s+from\s+['\"]typeorm['\"]", content)
            if typeorm_import_match:
                imports_str = typeorm_import_match.group(1)
                imports_list = [i.strip() for i in imports_str.split(',')]
                if not has_created and 'CreateDateColumn' not in imports_list:
                    imports_list.append('CreateDateColumn')
                if not has_updated and 'UpdateDateColumn' not in imports_list:
                    imports_list.append('UpdateDateColumn')
                
                new_imports_str = ", ".join(imports_list)
                content = content[:typeorm_import_match.start(1)] + new_imports_str + content[typeorm_import_match.end(1):]
    
    with open(f, 'w') as file:
        file.write(content)
    print(f"Processed {f}")

