import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      current_streak: number;
      best_streak: number;
      created_at: string;
    };
    
    meals: {
      id: string;
      user_id: string;
      description: string;
      type: string;
      created_at: string;
      updated_at: string;
      is_in_diet: boolean;
    };
  }
}
