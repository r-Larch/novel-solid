import { JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-novel-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-novel-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-novel-primary text-novel-primary-foreground hover:bg-novel-primary/90",
        destructive: "bg-novel-destructive text-novel-destructive-foreground hover:bg-novel-destructive/90",
        outline: "border border-novel-input bg-novel-background hover:bg-novel-accent hover:text-novel-accent-foreground",
        secondary: "bg-novel-secondary text-novel-secondary-foreground hover:bg-novel-secondary/80",
        ghost: "hover:bg-novel-accent hover:text-novel-accent-foreground",
        link: "text-novel-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = JSX.IntrinsicElements['button'] & VariantProps<typeof buttonVariants>;

const Button = (props: ButtonProps) => {
  const [_, rest] = splitProps(props, ['class', 'variant', 'size'])
  return (
    <button
      class={cn(buttonVariants({ variant: props.variant, size: props.size, class: props.class }))}
      {...rest}
    />
  );
};

export { Button, buttonVariants };
