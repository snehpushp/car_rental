'use client';

import { Car, Review } from "@/lib/types/database";
import { useState } from "react";
import { ChevronDown, Star, User } from "lucide-react";

interface CarDetailsTabsProps {
    car: Car;
}

export function CarDetailsTabs({ car }: CarDetailsTabsProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('reviews');

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            {/* Reviews Section */}
            <div className="border border-border">
                <button
                    onClick={() => toggleSection('reviews')}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
                >
                    <h3 className="text-lg font-semibold text-foreground">
                        Reviews ({car.reviews?.length || 0})
                    </h3>
                    <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                            expandedSection === 'reviews' ? 'rotate-180' : ''
                        }`} 
                    />
                </button>
                {expandedSection === 'reviews' && (
                    <div className="border-t border-border p-6">
                        {car.reviews && car.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {car.reviews.map((review: Review) => (
                                    <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className="flex items-center rounded-full overflow-hidden justify-center">
                                                {review.customer?.avatar_url ? (
                                                    <img 
                                                        src={review.customer.avatar_url} 
                                                        alt={review.customer.full_name || 'User'} 
                                                        className="h-10 w-10 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center rounded-full justify-center bg-muted text-muted-foreground">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {review.customer?.full_name || 'Anonymous'}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDate(review.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={`h-4 w-4 ${
                                                                    i < review.rating 
                                                                        ? 'fill-yellow-400 text-yellow-400' 
                                                                        : 'text-muted-foreground'
                                                                }`} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-foreground leading-relaxed">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No reviews yet. Be the first to review this car!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 