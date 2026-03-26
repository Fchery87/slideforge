import type { UserProfile } from "@/domain/identity/entities/user-profile";
import type { IUserRepository } from "@/domain/identity/repositories/user-repository.interface";

export interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export class UpdateProfileCommand {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new Error("User profile not found");
    }
    return this.userRepository.update(userId, input);
  }
}
