import PostsBoard from "@/components/dashboard/posts-board";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PostsBoard
      title="Review Content"
      description="Edit the imported caption, then approve or reject this post."
      postId={id}
    />
  );
}
