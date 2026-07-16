import React, { forwardRef, useState, useEffect, useRef, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  searchable?: boolean;
  placeholder?: string;
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeIn" }
  }
};

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, children, className, disabled, searchable = false, onChange, placeholder, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | number>(
      (props.value as string | number) ?? (props.defaultValue as string | number) ?? ""
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    // Sync state with outer value prop
    useEffect(() => {
      if (props.value !== undefined) {
        setSelectedValue(props.value as string | number);
      }
    }, [props.value]);

    // Parse children to extract options if option tags are used instead of options prop
    const parsedOptions = useMemo(() => {
      if (options) return options;
      if (!children) return [];

      const opts: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as any;
          if (child.type === "option" || childProps.value !== undefined) {
            opts.push({
              value: childProps.value,
              label: childProps.children ? String(childProps.children) : String(childProps.value)
            });
          }
        }
      });
      return opts;
    }, [options, children]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery) return parsedOptions;
      return parsedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [parsedOptions, searchQuery]);

    // Track active option
    const currentOption = useMemo(() => {
      return parsedOptions.find((opt) => String(opt.value) === String(selectedValue));
    }, [parsedOptions, selectedValue]);

    // Auto-focus search input when dropdown opens
    useEffect(() => {
      if (isOpen) {
        setHighlightedIndex(-1);
        setSearchQuery("");
        if (searchable) {
          const timer = setTimeout(() => {
            searchInputRef.current?.focus();
          }, 50);
          return () => clearTimeout(timer);
        }
      }
    }, [isOpen, searchable]);

    // Close dropdown on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Set internal/forwarded ref
    const handleRef = (node: HTMLSelectElement | null) => {
      selectRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
      }
    };

    const handleOptionSelect = (val: string | number) => {
      setSelectedValue(val);
      setIsOpen(false);

      if (selectRef.current) {
        selectRef.current.value = String(val);

        // Dispatch native change event so parent framework (e.g. react-hook-form) intercepts the change
        const event = new Event("change", { bubbles: true });
        selectRef.current.dispatchEvent(event);
      }

      if (onChange) {
        const changeEvent = {
          target: selectRef.current || { value: val, name: props.name },
          currentTarget: selectRef.current || { value: val, name: props.name }
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(changeEvent);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[highlightedIndex].value);
          } else if (filteredOptions.length === 1) {
            handleOptionSelect(filteredOptions[0].value);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    const displayLabel = currentOption
      ? currentOption.label
      : (placeholder || "Chọn tùy chọn...");

    return (
      <div className="space-y-1.5 w-full relative" ref={containerRef}>
        {label && (
          <label className="text-xs font-semibold text-slate-400">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Hidden Select element for HTML Form and library compatibility */}
        <select
          ref={handleRef}
          value={selectedValue}
          disabled={disabled}
          className="sr-only"
          onChange={() => {}} // dummy handler to avoid read-only React warnings
          {...props}
        >
          {parsedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Dropdown Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={twMerge(
            "relative flex items-center justify-between w-full bg-slate-950 border rounded-lg px-3 py-2.5 text-sm text-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-left focus:outline-none focus:border-indigo-500",
            error ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-slate-850",
            isOpen ? "border-indigo-500 ring-1 ring-indigo-500" : "",
            className
          )}
        >
          <span className={currentOption ? "text-slate-100" : "text-slate-500"}>
            {displayLabel}
          </span>
          <ChevronDown
            className={twMerge(
              "w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-2",
              isOpen ? "transform rotate-180 text-indigo-400" : ""
            )}
          />
        </button>

        {/* Dropdown Options List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dropdownVariants as any}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-950 border border-slate-850 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Optional Search Input */}
              {searchable && (
                <div className="p-2 border-b border-slate-850 flex items-center gap-2 bg-slate-950">
                  <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-100 focus:outline-none placeholder-slate-600"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Options Items */}
              <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt, index) => {
                    const isSelected = String(opt.value) === String(selectedValue);
                    const isHighlighted = index === highlightedIndex;

                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleOptionSelect(opt.value)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={twMerge(
                          "px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between",
                          isSelected ? "text-indigo-400 font-medium" : "text-slate-300",
                          isHighlighted || isSelected ? "bg-slate-900" : "hover:bg-slate-900/50"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2.5 text-xs text-slate-500 text-center">
                    Không tìm thấy kết quả
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error or Helper messages */}
        {error ? (
          <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
