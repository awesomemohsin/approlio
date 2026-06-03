import PostsBoard from "@/components/dashboard/posts-board";

export default function ApprovedQueuePage() {
  return (
    <PostsBoard
      title="Approved Content"
      description="Approved posts ready for Meta publishing."
      defaultStatus="approved"
      lockStatus
    />
  );
}
