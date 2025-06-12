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
    <Card className="mt-6">
        <CardHeader>
            <CardTitle>Owner Information</CardTitle>
        </CardHeader>
        <CardContent>
            <Link href={`/profile/${owner.id}`} className="flex items-center gap-4 group">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={owner.avatar_url || ''} alt={owner.full_name || 'Owner'} />
                    <AvatarFallback>{owner.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="text-lg font-semibold group-hover:underline">{owner.full_name}</h4>
                    <p className="text-sm text-muted-foreground">Member since {new Date(owner.created_at).getFullYear()}</p>
                </div>
            </Link>
        </CardContent>
    </Card>
  );
} 