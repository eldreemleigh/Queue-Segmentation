import SectionCard from "../SectionCard";

export default function SectionCardExample() {
  return (
    <SectionCard sectionNumber={1} title="Example Section">
      <p className="text-muted-foreground">This is the section content area.</p>
    </SectionCard>
  );
}
