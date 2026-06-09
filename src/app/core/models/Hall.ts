export interface Hall {
  id: number;
  name: string;
  capacity: number;
  cinemaId: number;
}

export interface CreateHallDTO {
  name: string;
  capacity: number;
  cinemaId: number;
}
