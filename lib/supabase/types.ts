export type SourcePlatform = "facebook" | "youtube" | "tiktok" | "rss" | "website";
export type PostStatus = "pending" | "approved" | "posted" | "rejected" | "failed";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Profile = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export type Source = {
  id: string;
  profile_id: string;
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
  profile_id: string;
  source_id: string | null;
  source_post_id: string;
  source_url: string;
  platform: SourcePlatform;
  thumbnail_url: string | null;
  video_url: string | null;
  additional_images: string[] | null;
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

export type Connection = {
  id: string;
  profile_id: string;
  name: string;
  platform: SourcePlatform;
  type: string;
  platform_id: string;
  token_data: Json;
  active: boolean;
  created_at: string;
};

export type PostDestination = {
  id: string;
  post_id: string;
  connection_id: string;
  status: PostStatus;
  published_at: string | null;
  published_response: Json | null;
  last_error: string | null;
  created_at: string;
};

export type Setting = {
  profile_id: string;
  key: string;
  value: Json;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "name">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      sources: {
        Row: Source;
        Insert: Partial<Source> & Pick<Source, "name" | "platform" | "url" | "profile_id">;
        Update: Partial<Source>;
        Relationships: [
          {
            foreignKeyName: "sources_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: Post;
        Insert: Partial<Post> & Pick<Post, "source_post_id" | "source_url" | "platform" | "profile_id">;
        Update: Partial<Post>;
        Relationships: [
          {
            foreignKeyName: "posts_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
      connections: {
        Row: Connection;
        Insert: Partial<Connection> & Pick<Connection, "name" | "platform" | "type" | "platform_id" | "profile_id">;
        Update: Partial<Connection>;
        Relationships: [
          {
            foreignKeyName: "connections_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_destinations: {
        Row: PostDestination;
        Insert: Partial<PostDestination> & Pick<PostDestination, "post_id" | "connection_id">;
        Update: Partial<PostDestination>;
        Relationships: [
          {
            foreignKeyName: "post_destinations_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_destinations_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: Setting;
        Insert: Partial<Setting> & Pick<Setting, "profile_id" | "key" | "value">;
        Update: Partial<Setting>;
        Relationships: [
          {
            foreignKeyName: "settings_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
