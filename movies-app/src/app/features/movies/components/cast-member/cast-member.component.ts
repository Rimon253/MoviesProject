import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CastMember } from '../../../../shared/models/movie.interface';

@Component({
  selector: 'app-cast-member',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cast-member.component.html',
  styleUrls: ['./cast-member.component.scss']
})
export class CastMemberComponent {
  @Input({ required: true }) member!: CastMember;

  getProfileUrl(path: string): string {
    return `https://image.tmdb.org/t/p/w185${path}`;
  }
} 