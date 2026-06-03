import PostsBoard from "@/components/dashboard/posts-board";

export default function FailedPage() {
  return (
    <PostsBoard
      title="Failed Posts"
      description="Posts that need retry or configuration review."
      defaultStatus="failed"
      lockStatus
    />
  );
}
