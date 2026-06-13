import { describe, expect, it } from "vitest";

import {
  LEAVE_VALIDATION_ERRORS,
  toDateKeyInTimezone,
  validateLeaveRequest,
  type ExistingLeaveRequest,
} from "./index";

const TIMEZONE = "Asia/Karachi";
const TODAY = "2026-06-08";

function makeLeave(
  overrides: Partial<ExistingLeaveRequest> & Pick<ExistingLeaveRequest, "id">,
): ExistingLeaveRequest {
  return {
    start_date: TODAY,
    end_date: TODAY,
    status: "pending",
    ...overrides,
  };
}

describe("validateLeaveRequest", () => {
  it("blocks leave for today when attendance already exists", () => {
    const error = validateLeaveRequest({
      startDate: TODAY,
      endDate: TODAY,
      today: TODAY,
      attendanceDateKeys: [TODAY],
      existingLeaves: [],
    });

    expect(error).toBe(LEAVE_VALIDATION_ERRORS.ATTENDANCE_EXISTS);
  });

  it("allows a future leave request when no attendance or overlap exists", () => {
    const error = validateLeaveRequest({
      startDate: "2026-06-10",
      endDate: "2026-06-12",
      today: TODAY,
      attendanceDateKeys: [],
      existingLeaves: [],
    });

    expect(error).toBeNull();
  });

  it("blocks leave requests that start in the past", () => {
    const error = validateLeaveRequest({
      startDate: "2026-06-07",
      endDate: "2026-06-09",
      today: TODAY,
      attendanceDateKeys: [],
      existingLeaves: [],
    });

    expect(error).toBe(LEAVE_VALIDATION_ERRORS.PAST_DATE);
  });

  it("blocks overlapping pending or approved leave requests", () => {
    const error = validateLeaveRequest({
      startDate: "2026-06-10",
      endDate: "2026-06-12",
      today: TODAY,
      attendanceDateKeys: [],
      existingLeaves: [
        makeLeave({
          id: "leave-1",
          start_date: "2026-06-11",
          end_date: "2026-06-13",
          status: "approved",
        }),
      ],
    });

    expect(error).toBe(LEAVE_VALIDATION_ERRORS.OVERLAPPING_LEAVE);
  });

  it("blocks approval when attendance was recorded after submission", () => {
    const error = validateLeaveRequest({
      startDate: TODAY,
      endDate: TODAY,
      today: TODAY,
      attendanceDateKeys: [TODAY],
      existingLeaves: [
        makeLeave({
          id: "leave-pending",
          start_date: TODAY,
          end_date: TODAY,
          status: "pending",
        }),
      ],
      excludeLeaveId: "leave-pending",
    });

    expect(error).toBe(LEAVE_VALIDATION_ERRORS.ATTENDANCE_EXISTS);
  });

  it("allows leave for today when attendance has not been recorded yet", () => {
    const error = validateLeaveRequest({
      startDate: TODAY,
      endDate: TODAY,
      today: TODAY,
      attendanceDateKeys: [],
      existingLeaves: [],
    });

    expect(error).toBeNull();
  });

  it("ignores rejected and cancelled leave when checking overlap", () => {
    const error = validateLeaveRequest({
      startDate: TODAY,
      endDate: TODAY,
      today: TODAY,
      attendanceDateKeys: [],
      existingLeaves: [
        makeLeave({
          id: "leave-rejected",
          status: "rejected",
        }),
        makeLeave({
          id: "leave-cancelled",
          status: "cancelled",
        }),
      ],
    });

    expect(error).toBeNull();
  });
});

describe("validateLeaveRequest timezone helpers", () => {
  it("uses org timezone when deriving attendance date keys", () => {
    const key = toDateKeyInTimezone("2026-06-07T20:00:00.000Z", TIMEZONE);
    expect(key).toBe("2026-06-08");
  });
});
