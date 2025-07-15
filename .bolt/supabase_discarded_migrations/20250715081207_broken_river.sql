/*
  # Create blog schema

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `author_id` (uuid, references auth.users)
      - `published` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `posts` table
    - Add policies for public read access to published posts
    - Add policies for authenticated owners to manage posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published posts
CREATE POLICY "Anyone can read published posts"
  ON posts
  FOR SELECT
  TO public
  USING (published = true);

-- Allow authenticated users to manage their own posts
CREATE POLICY "Authors can manage their own posts"
  ON posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();