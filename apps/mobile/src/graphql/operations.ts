import { gql } from "@apollo/client";
import type { CareType } from "@savia/shared";

// Tipos de los resultados (equivalen al schema de apps/api). En una iteración
// posterior se pueden autogenerar con GraphQL Codegen; por ahora se tipan a mano.

export interface CareSchedule {
  id: string;
  type: CareType;
  intervalDays: number;
  lastDoneAt: string | null;
  nextDueAt: string | null;
}

export interface Plant {
  id: string;
  name: string;
  species: string | null;
  photoUrl: string | null;
  schedules: CareSchedule[];
}

export interface CareEvent {
  id: string;
  type: CareType;
  doneAt: string;
}

export interface PlantDetail extends Plant {
  events: CareEvent[];
}

export interface Me {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  notifyHour: number;
  notifyDayBefore: boolean;
  notifyDayOf: boolean;
}

const SCHEDULE_FIELDS = gql`
  fragment ScheduleFields on CareSchedule {
    id
    type
    intervalDays
    lastDoneAt
    nextDueAt
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      timezone
      notifyHour
      notifyDayBefore
      notifyDayOf
    }
  }
`;

export const MY_PLANTS_QUERY = gql`
  query MyPlants {
    myPlants {
      id
      name
      species
      photoUrl
      schedules {
        ...ScheduleFields
      }
    }
  }
  ${SCHEDULE_FIELDS}
`;

export const PLANT_QUERY = gql`
  query Plant($id: ID!) {
    plant(id: $id) {
      id
      name
      species
      photoUrl
      schedules {
        ...ScheduleFields
      }
      events {
        id
        type
        doneAt
      }
    }
  }
  ${SCHEDULE_FIELDS}
`;

export const CALENDAR_EVENTS_QUERY = gql`
  query CalendarEvents($from: Date!, $to: Date!) {
    calendarEvents(from: $from, to: $to) {
      id
      type
      doneAt
    }
  }
`;

export const ADD_PLANT_MUTATION = gql`
  mutation AddPlant($name: String!, $species: String, $care: [CareInput!]!) {
    addPlant(name: $name, species: $species, care: $care) {
      id
      name
      species
      schedules {
        ...ScheduleFields
      }
    }
  }
  ${SCHEDULE_FIELDS}
`;

export const LOG_CARE_MUTATION = gql`
  mutation LogCare($plantId: ID!, $type: CareType!) {
    logCare(plantId: $plantId, type: $type) {
      ...ScheduleFields
    }
  }
  ${SCHEDULE_FIELDS}
`;

export const UPDATE_NOTIFICATION_PREFS_MUTATION = gql`
  mutation UpdateNotificationPrefs(
    $notifyHour: Int
    $notifyDayBefore: Boolean
    $notifyDayOf: Boolean
  ) {
    updateNotificationPrefs(
      notifyHour: $notifyHour
      notifyDayBefore: $notifyDayBefore
      notifyDayOf: $notifyDayOf
    ) {
      id
      notifyHour
      notifyDayBefore
      notifyDayOf
    }
  }
`;

export interface CareInput {
  type: CareType;
  intervalDays: number;
  lastDoneAt: string;
}
