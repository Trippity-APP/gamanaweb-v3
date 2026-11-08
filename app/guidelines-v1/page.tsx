import { Foundation } from "@/components/guidelines/sections/Foundation";
import { Logo } from "@/components/guidelines/sections/Logo";
import { Color } from "@/components/guidelines/sections/Color";
import { Typography } from "@/components/guidelines/sections/Typography";
import { Voice } from "@/components/guidelines/sections/Voice";
import { Imagery } from "@/components/guidelines/sections/Imagery";
import { Components } from "@/components/guidelines/sections/Components";
import { Accessibility, Layout } from "@/components/guidelines/sections/LayoutA11y";

export default function GuidelinesPage() {
  return (
    <div className="space-y-28">
      <Foundation />
      <Logo />
      <Color />
      <Typography />
      <Voice />
      <Imagery />
      <Components />
      <Layout />
      <Accessibility />
    </div>
  );
}
