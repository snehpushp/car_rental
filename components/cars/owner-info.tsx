import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/lib/types/database';
import Link from 'next/link';

interface OwnerInfoProps {
  owner?: Profile;
}

export function OwnerInfo({ owner }: OwnerInfoProps) {
  if (!owner) {
    return null;
  }

  return (
    <div className="p-6 bg-muted/20 border border-border">
        <Link href={`/profile/${owner.id}`} className="flex items-center gap-4 group">
            <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={owner.avatar_url || ''} alt={owner.full_name || 'Owner'} />
                <AvatarFallback className="bg-muted text-foreground font-semibold">
                    {owner.full_name?.[0] || 'U'}
                </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {owner.full_name}
                </h4>
                <p className="text-sm text-muted-foreground">
                    Member since {new Date(owner.created_at).getFullYear()}
                </p>
            </div>
        </Link>
    </div>
  );
} 