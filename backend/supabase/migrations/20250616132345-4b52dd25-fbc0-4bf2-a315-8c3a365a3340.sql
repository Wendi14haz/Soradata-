
-- Create table for data quality reports
CREATE TABLE public.data_quality_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_id UUID REFERENCES public.user_files(id) NOT NULL,
  validation_results JSONB NOT NULL,
  quality_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  issues_found INTEGER NOT NULL DEFAULT 0,
  total_checks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_quality_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for data quality reports
CREATE POLICY "Users can view their own quality reports" 
  ON public.data_quality_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quality reports" 
  ON public.data_quality_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quality reports" 
  ON public.data_quality_reports 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create table for validation rules configuration
CREATE TABLE public.validation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('missing_value', 'outlier', 'duplicate', 'format', 'data_type')),
  rule_config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for validation rules
ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own validation rules" 
  ON public.validation_rules 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to initialize default validation rules for new users
CREATE OR REPLACE FUNCTION public.create_default_validation_rules()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.validation_rules (user_id, rule_name, rule_type, rule_config) VALUES
    (NEW.id, 'Missing Value Threshold', 'missing_value', '{"max_percentage": 10}'),
    (NEW.id, 'Outlier Detection', 'outlier', '{"z_score_threshold": 3}'),
    (NEW.id, 'Date Format Check', 'format', '{"allowed_formats": ["YYYY-MM-DD", "DD/MM/YYYY"]}'),
    (NEW.id, 'Numeric Data Type', 'data_type', '{"expected_type": "numeric"}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default validation rules for new users
CREATE TRIGGER create_default_validation_rules_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_validation_rules();
