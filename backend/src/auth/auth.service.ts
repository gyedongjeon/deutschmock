import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface GoogleUser {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    googleId: string;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateUser(details: GoogleUser) {
        // Find user by email
        let user = await this.userRepository.findOneBy({ email: details.email });

        if (user) {
            // Update info if persists (optional)
            user.firstName = details.firstName;
            user.lastName = details.lastName;
            user.picture = details.picture;
            user.googleId = details.googleId;
            return await this.userRepository.save(user);
        }

        // Create new if not exists
        const newUser = this.userRepository.create(details);
        return await this.userRepository.save(newUser);
    }

    async findUser(id: number) {
        return await this.userRepository.findOneBy({ id });
    }

    async updateLanguage(userId: number, language: string) {
        return await this.userRepository.update(userId, { language });
    }

    async updateLevel(userId: number, level: string) {
        return await this.userRepository.update(userId, { level });
    }
}
