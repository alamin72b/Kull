export interface Activity {
    id : string;
    name : string;
    activityDate: string;
    startAt: string;
    endAt: string;
    note: string | null;
    createdAt: string;
    updateAt: string;
}

export interface ActivityInput {
    id : string;
    name : string;
    activityDate: string;
    startAt: string;
    endAt: string;
    note: string | null;
}