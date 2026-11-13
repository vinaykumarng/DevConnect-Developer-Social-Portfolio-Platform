// Input with the small label inside the box, as in the Figma.
export default function FloatingInput({ label, id, ...props }) {
    return (
        <div className="relative rounded-md border-2 border-line bg-surface transition-colors focus-within:border-link">
            <label htmlFor={id} className="absolute left-2.5 top-1.5 text-[11px] text-muted [div:focus-within>&]:text-link">
                {label}
            </label>
            <input id={id} className="h-12 w-full bg-transparent px-2.5 pb-1 pt-5 text-sm focus:outline-none" {...props} />
        </div>
    );
}
