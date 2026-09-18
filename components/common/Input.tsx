interface InputProps {
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
}

export default function Input({
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  required,
}: InputProps) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full border border-white/20 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/50 outline-none focus:border-[#C6FF00] transition-colors ${className}`}
    />
  );
}
