import { Foundation } from "@/components/guidelines/sections/Foundation";
import { Logo } from "@/components/guidelines/sections/Logo";
import { Color } from "@/components/guidelines/sections/Color";
import { Typography } from "@/components/guidelines/sections/Typography";

export default function GuidelinesPage() {
  return (
    <div className="space-y-28">
      <Foundation />
      <Logo />
      <Color />
      <Typography />
    </div>
  );
}
