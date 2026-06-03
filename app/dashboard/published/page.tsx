import PostsBoard from "@/components/dashboard/posts-board";

export default function PublishedPage() {
  return (
    <PostsBoard
      title="Published Content"
      description="Posts successfully published to the destination Facebook Page."
      defaultStatus="posted"
      lockStatus
    />
  );
}
