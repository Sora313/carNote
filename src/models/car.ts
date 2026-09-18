export type Car = {
  _id: string;
  name: string;
  plate: string;
  model: string;
};

export type CarInput = Omit<Car, "_id">;