import PostsBoard from "@/components/dashboard/posts-board";

export default function PendingQueuePage() {
  return (
    <PostsBoard
      title="Pending Approval"
      description="Review imported content and edit captions before approval."
      defaultStatus="pending"
      lockStatus
    />
  );
}
