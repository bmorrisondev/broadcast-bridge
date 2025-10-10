import EditEpisodeForm from "./EditEpisodeForm";
import { Id } from "../../../../../convex/_generated/dataModel";

interface EpisodePageProps {
  params: Promise<{ id: string }>;
}

export default async function EpisodePage(props: EpisodePageProps) {
  const { params } = await props;
  const { id } = await params;

  return <EditEpisodeForm id={id as Id<"episodes">} />;
}
