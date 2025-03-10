
import { JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

const DEFAULT_ORIENTATION = 'horizontal';
const ORIENTATIONS = ['horizontal', 'vertical'] as const;

type Orientation = (typeof ORIENTATIONS)[number];

type SeparatorProps = JSX.IntrinsicElements['div'] & {
  orientation: Orientation;
  decorative?: boolean;
}

const Separator = (props: SeparatorProps) => {
  const [_, rest] = splitProps(props, ['decorative', 'orientation'])

  const orientation = () => props.orientation ?? DEFAULT_ORIENTATION;
  // `aria-orientation` defaults to `horizontal` so we only need it if `orientation` is vertical
  const ariaOrientation = () => orientation() === 'vertical' ? orientation() : undefined;
  const semanticProps = () => props.decorative === false
    ? { 'aria-orientation': ariaOrientation, role: 'separator' }
    : { role: 'none' };

  return (
    <div
      ref={props.ref}
      class={cn("flex-[0_0_0.5px] bg-novel-border antialiased transform-gpu", orientation() === "horizontal" ? "h-[1px] w-full" : " w-[1px]", props.class)}
      data-orientation={orientation()}
      {...semanticProps}
      {...rest}
    />
  )
};

export { Separator };
