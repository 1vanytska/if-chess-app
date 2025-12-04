import { UserRole } from "prisma/generated/enums";

export interface TokenPayload {
    userId: number;
    role: UserRole;
}