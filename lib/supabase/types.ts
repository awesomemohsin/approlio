export type SourcePlatform = "facebook" | "youtube" | "tiktok" | "rss" | "website";
export type PostStatus = "pending" | "approved" | "posted" | "rejected" | "failed";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Source = {
  id: string;
  name: string;
  platform: SourcePlatform;
  url: string;
  active: boolean;
  metadata: Json;
  last_checked_at: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  source_id: string | null;
  source_post_id: string;
  source_url: string;
  platform: SourcePlatform;
  thumbnail_url: string | null;
  video_url: string | null;
  original_caption: string | null;
  edited_caption: string | null;
  status: PostStatus;
  source_published_at: string | null;
  published_at: string | null;
  published_response: Json | null;
  telegram_message_id: number | null;
  retry_count: number;
  next_retry_at: string | null;
  last_error: string | null;
  created_at: string;
};

export type PublishLog = {
  id: string;
  post_id: string | null;
  action: string;
  status: string;
  response: Json;
  actor: string;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: Source;
        Insert: Partial<Omit<Source, "id" | "created_at">> & Pick<Source, "name" | "platform" | "url">;
        Update: Partial<Omit<Source, "id" | "created_at">>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: Partial<Omit<Post, "id" | "created_at">> &
          Pick<Post, "source_post_id" | "source_url" | "platform">;
        Update: Partial<Omit<Post, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "posts_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      publish_logs: {
        Row: PublishLog;
        Insert: Partial<Omit<PublishLog, "id" | "created_at">> & Pick<PublishLog, "status">;
        Update: Partial<Omit<PublishLog, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "publish_logs_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      source_platform: SourcePlatform;
      post_status: PostStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
