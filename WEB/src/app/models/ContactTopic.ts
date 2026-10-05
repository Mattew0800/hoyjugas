export interface ContactTopic {
  id: string;
  label: string;
  message: string;
  webAlternative?: {
    title: string;
    description: string;
    buttonText: string;
    route: string;
  };
}
