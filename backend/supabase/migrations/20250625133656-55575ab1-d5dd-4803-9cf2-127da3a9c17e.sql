
-- Add pinned column to chat_sessions table and create index for better performance
ALTER TABLE public.chat_sessions 
ADD COLUMN pinned BOOLEAN DEFAULT false;

-- Create index for better query performance on pinned chats
CREATE INDEX idx_chat_sessions_pinned_updated ON public.chat_sessions(pinned DESC, updated_at DESC) WHERE pinned = true;

-- Create function to limit pinned chats to maximum 3 per user
CREATE OR REPLACE FUNCTION public.limit_pinned_chats()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated record is being pinned
  IF NEW.pinned = true THEN
    -- Count existing pinned chats for this user (excluding current record if updating)
    IF (SELECT COUNT(*) FROM public.chat_sessions 
        WHERE user_id = NEW.user_id 
        AND pinned = true 
        AND id != COALESCE(OLD.id, '00000000-0000-0000-0000-000000000000'::uuid)) >= 3 THEN
      RAISE EXCEPTION 'Maximum 3 chats can be pinned at once';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce pinned chat limit
CREATE TRIGGER enforce_pinned_chat_limit
  BEFORE INSERT OR UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.limit_pinned_chats();
