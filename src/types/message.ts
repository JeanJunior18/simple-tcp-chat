export type Message = {
  from: string;
  content: string;
  timestamp: number;
  type: 'message' | 'intro' | 'system'
};
