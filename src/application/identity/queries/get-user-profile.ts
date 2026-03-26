import type { UserProfile } from "@/domain/identity/entities/user-profile";
import type { IUserRepository } from "@/domain/identity/repositories/user-repository.interface";

export class GetUserProfileQuery {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return this.userRepository.findById(userId);
  }
}
