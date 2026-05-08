import React from "react";
import {
  Users,
  Luggage,
  Settings,
  Fuel,
  Star,
  Check,
  TrendingUp,
  Wifi,
  Waves,
  Car,
  Sparkles,
  Dumbbell,
  Coffee,
  PlaneTakeoff,
  UtensilsCrossed,
  Beer,
  Snowflake,
  Briefcase,
  Shirt,
  Bed,
  MapPin
} from "lucide-react";
import { ComparisonConfig } from "./GenericComparison";

// Hotel amenities mapping
const hotelAmenities = [
  { id: "wifi", name: "Free WiFi", icon: <Wifi className="w-4 h-4" /> },
  { id: "pool", name: "Swimming Pool", icon: <Waves className="w-4 h-4" /> },
  { id: "parking", name: "Free Parking", icon: <Car className="w-4 h-4" /> },
  { id: "spa", name: "Spa", icon: <Sparkles className="w-4 h-4" /> },
  { id: "gym", name: "Fitness Center", icon: <Dumbbell className="w-4 h-4" /> },
  { id: "breakfast", name: "Free Breakfast", icon: <Coffee className="w-4 h-4" /> },
  { id: "airport-shuttle", name: "Airport Shuttle", icon: <PlaneTakeoff className="w-4 h-4" /> },
  { id: "restaurant", name: "Restaurant", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: "bar", name: "Bar/Lounge", icon: <Beer className="w-4 h-4" /> },
  { id: "ac", name: "Air Conditioning", icon: <Snowflake className="w-4 h-4" /> },
  { id: "business", name: "Business Center", icon: <Briefcase className="w-4 h-4" /> },
  { id: "laundry", name: "Laundry Service", icon: <Shirt className="w-4 h-4" /> },
];

// Car features mapping
const carFeatures = [
  { id: "ac", name: "Air Conditioning", icon: <Snowflake className="w-4 h-4" /> },
  { id: "bluetooth", name: "Bluetooth", icon: <span className="w-4 h-4">🔗</span> },
  { id: "gps", name: "GPS Navigation", icon: <MapPin className="w-4 h-4" /> },
  { id: "camera", name: "Backup Camera", icon: <span className="w-4 h-4">📷</span> },
  { id: "parking", name: "Parking Sensors", icon: <Car className="w-4 h-4" /> },
  { id: "cruise", name: "Cruise Control", icon: <Settings className="w-4 h-4" /> },
  { id: "usb", name: "USB Ports", icon: <span className="w-4 h-4">🔌</span> },
  { id: "child", name: "Child Seat", icon: <span className="w-4 h-4">👶</span> },
];

export const createCarComparisonConfig = (suppliers: any[]): ComparisonConfig => ({
  type: 'cars',
  maxItems: 3,
  modalTitle: 'Compare Cars',
  floatingBarIcon: <TrendingUp className="w-5 h-5 mr-2" />,
  bookingUrl: '/cars',
  buttonText: 'Select This Car',
  tips: [
    'Compare total prices, not just daily rates',
    'Check included features and additional driver policies',
    'Consider fuel type and mileage limits for longer trips',
    'Review cancellation policies before booking'
  ],
  renderItem: (car: any) => (
    <>
      {/* Supplier Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mr-2">
            <span className="font-bold text-primary text-xs">
              {suppliers.find(s => s.name === car.supplier)?.logo || car.supplier.substring(0, 2)}
            </span>
          </div>
          <span className="font-semibold">{car.supplier}</span>
        </div>
        <p className="text-muted-foreground text-sm">{car.category}</p>
      </div>

      {/* Price */}
      <div className="mb-4 p-3 bg-primary/10 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">${car.totalPrice}</div>
          <div className="text-sm text-muted-foreground">total • ${car.pricePerDay}/day</div>
          {(car.discount ?? 0) > 0 && (
            <div className="text-sm text-success">Save {car.discount}%</div>
          )}
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-muted-foreground mr-2" />
            <span>{car.seats} seats</span>
          </div>
          <div className="flex items-center">
            <Luggage className="w-4 h-4 text-muted-foreground mr-2" />
            <span>{car.bags} bags</span>
          </div>
          <div className="flex items-center">
            <Settings className="w-4 h-4 text-muted-foreground mr-2" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center">
            <Fuel className="w-4 h-4 text-muted-foreground mr-2" />
            <span>{car.fuel}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
          <span className="text-sm">Customer Rating</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="font-semibold">{car.rating}</span>
            <span className="text-muted-foreground text-sm ml-1">({car.reviews})</span>
          </div>
        </div>

        {/* Mileage */}
        <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
          <span className="text-sm">Mileage</span>
          <span className="font-semibold">{car.mileage}</span>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Features:</h4>
        <div className="flex flex-wrap gap-1">
          {car.features.slice(0, 6).map((featureId: string, index: number) => {
            const feature = carFeatures.find(f => f.id === featureId);
            return feature ? (
              <span key={index} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">
                {feature.name}
              </span>
            ) : null;
          })}
          {car.features.length > 6 && (
            <span className="text-primary text-xs">+{car.features.length - 6} more</span>
          )}
        </div>
      </div>

      {/* Deals */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Deals:</h4>
        <div className="space-y-1">
          {car.deals.slice(0, 3).map((deal: any, index: number) => (
            <div key={index} className={`text-xs px-2 py-1 rounded ${deal.highlight ? 'bg-success/20 text-success' : 'bg-muted text-foreground'}`}>
              {deal.text}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        {car.freeCancellation && (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-success mr-1" />
            <span>Free cancellation</span>
          </div>
        )}
        {car.instantConfirmation && (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-success mr-1" />
            <span>Instant confirmation</span>
          </div>
        )}
      </div>
    </>
  )
});

export const createFlightComparisonConfig = (): ComparisonConfig => ({
  type: 'flights',
  maxItems: 3,
  modalTitle: 'Compare Flights',
  floatingBarIcon: <span className="w-5 h-5 mr-2">✈️</span>,
  bookingUrl: '/flights',
  buttonText: 'Select This Flight',
  tips: [
    'Compare total travel time, including layovers',
    'Check baggage allowances and fees',
    'Consider departure and arrival times for your schedule',
    'Look for airlines with better on-time performance'
  ],
  renderItem: (flight: any) => (
    <>
      {/* Airline Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mr-2 text-xs">
            {flight.airlineCode}
          </div>
          <span className="font-semibold">{flight.airline}</span>
        </div>
        <p className="text-muted-foreground text-sm">{flight.flightNumber}</p>
      </div>

      {/* Price */}
      <div className="mb-4 p-3 bg-primary/10 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">${flight.price}</div>
          <div className="text-sm text-muted-foreground">per person</div>
        </div>
      </div>

      {/* Flight Times */}
      <div className="mb-4">
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
          <div className="text-center">
            <div className="font-bold text-lg">{flight.departureTime}</div>
            <div className="text-sm text-muted-foreground">{flight.fromCode}</div>
          </div>
          <div className="text-center px-2">
            <div className="text-sm text-muted-foreground">{flight.duration}</div>
            <div className="w-8 border-t border-foreground my-1"></div>
            <div className="text-xs text-muted-foreground">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{flight.arrivalTime}</div>
            <div className="text-sm text-muted-foreground">{flight.toCode}</div>
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
          <span className="text-sm">Rating</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="font-semibold">{flight.rating}</span>
            <span className="text-muted-foreground text-sm ml-1">({flight.reviews})</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
          <span className="text-sm">Duration</span>
          <span className="font-semibold">{flight.duration}</span>
        </div>

        {flight.amenities && (
          <div className="p-2 bg-card rounded-lg border">
            <div className="text-sm font-semibold mb-2">Amenities</div>
            <div className="flex flex-wrap gap-1">
              {flight.amenities.slice(0, 4).map((amenity: string, index: number) => (
                <span key={index} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="space-y-1 text-xs text-muted-foreground">
        {flight.freeCancellation && (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-success mr-1" />
            <span>Free cancellation</span>
          </div>
        )}
        {flight.seatSelection && (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-success mr-1" />
            <span>Seat selection available</span>
          </div>
        )}
      </div>
    </>
  )
});

export const createHotelComparisonConfig = (): ComparisonConfig => ({
  type: 'hotels',
  maxItems: 3,
  modalTitle: 'Compare Hotels',
  floatingBarIcon: <Bed className="w-5 h-5 mr-2" />,
  bookingUrl: '/hotels',
  buttonText: 'Select This Hotel',
  tips: [
    'Compare total prices including taxes and fees',
    'Check location proximity to your planned activities',
    'Review included amenities and services',
    'Consider guest ratings and recent reviews'
  ],
  renderItem: (hotel: any) => (
    <>
      {/* Hotel Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {/* Star Rating */}
            <div className="flex items-center bg-primary/20 text-primary px-2 py-1 rounded-lg mr-2">
              {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{hotel.propertyType || 'Hotel'}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{hotel.address}</p>
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{hotel.distanceFromCenter || '2.1 km from center'}</span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4 p-3 bg-primary/10 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">${hotel.totalPrice || hotel.price}</div>
          <div className="text-sm text-muted-foreground">
            total • ${hotel.price}/night
            {hotel.taxes && <span> + ${hotel.taxes} taxes</span>}
          </div>
          {(hotel.discount ?? 0) > 0 && (
            <div className="text-sm text-success">Save {hotel.discount}%</div>
          )}
        </div>
      </div>

      {/* Ratings */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
          <span className="text-sm">Guest Rating</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="font-semibold">{hotel.rating}</span>
            <span className="text-muted-foreground text-sm ml-1">({hotel.reviews || 0})</span>
          </div>
        </div>

        {hotel.guestRating && (
          <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
            <span className="text-sm">Guest Score</span>
            <span className="font-semibold">{hotel.guestRating}/10</span>
          </div>
        )}

        {hotel.locationScore && (
          <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
            <span className="text-sm">Location Score</span>
            <span className="font-semibold">{hotel.locationScore}/10</span>
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Amenities:</h4>
        <div className="flex flex-wrap gap-1">
          {(hotel.amenities || []).slice(0, 6).map((amenityId: string, index: number) => {
            const amenity = hotelAmenities.find(a => a.id === amenityId);
            return amenity ? (
              <span key={index} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">
                {amenity.name}
              </span>
            ) : (
              <span key={index} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">
                {amenityId}
              </span>
            );
          })}
          {(hotel.amenities || []).length > 6 && (
            <span className="text-primary text-xs">+{(hotel.amenities || []).length - 6} more</span>
          )}
        </div>
      </div>

      {/* Meal Plan */}
      {hotel.mealPlan && (
        <div className="mb-4">
          <div className="flex items-center justify-between p-2 bg-card rounded-lg border">
            <span className="text-sm">Meal Plan</span>
            <span className="font-semibold text-sm">{hotel.mealPlan}</span>
          </div>
        </div>
      )}

      {/* Tags */}
      {hotel.tags && hotel.tags.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">Features:</h4>
          <div className="flex flex-wrap gap-1">
            {hotel.tags.slice(0, 4).map((tag: string, index: number) => (
              <span key={index} className="bg-muted/50 text-foreground px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="space-y-1 text-xs text-muted-foreground">
        {hotel.freeCancellation && (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-success mr-1" />
            <span>Free cancellation</span>
          </div>
        )}
        {hotel.payAtHotel && (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-success mr-1" />
            <span>Pay at hotel</span>
          </div>
        )}
        {hotel.instantConfirmation && (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-success mr-1" />
            <span>Instant confirmation</span>
          </div>
        )}
        {hotel.roomsLeft && hotel.roomsLeft < 5 && (
          <div className="flex items-center text-orange-600">
            <span>Only {hotel.roomsLeft} rooms left!</span>
          </div>
        )}
      </div>
    </>
  )
});