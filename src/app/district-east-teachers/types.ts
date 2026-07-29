export type TeacherRecord = {
  id: string;
  created_at: string;
  name: string;
  pid: string;
  designation: string;
  cnic?: string;
  mobile?: string;
  place_of_posting: string;
  semis_code?: string;
  taluka: string;
  contractual_appointment: string;
  regularization_date: string;
  increments_claimed: number;
  arrears: number;
  recurring_annual_cost: number;
  pensionary_implications: string;
  remarks?: string;
};
