"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  Car,
  Luggage,
  Users,
  Fuel,
  Snowflake,
  Settings,
  Check,
  Calendar,
  MapPin,
  ArrowRight,
  Shield,
  Clock,
  CreditCard,
  Star,
} from "lucide-react";

const CarBooking = () => {
  const router = useRouter();
  const t = useTranslations("Common");
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [showBookingSection, setShowBookingSection] = useState(false);

  const carOptions = [
    {
      id: 1,
      name: "Economy Basic",
      price: "Rs2,113/day",
      features: [
        { icon: <Luggage className="text-muted-foreground" />, text: "1 large suitcase", available: true },
        { icon: <Users className="text-muted-foreground" />, text: "Seats 4 passengers", available: true },
        { icon: <Snowflake className="text-muted-foreground" />, text: "Air conditioning included", available: true }
      ],
      popular: false
    },
    {
      id: 2,
      name: "Compact Value",
      price: "Rs2,876/day",
      features: [
        { icon: <Luggage className="text-muted-foreground" />, text: "2 large suitcases", available: true },
        { icon: <Users className="text-muted-foreground" />, text: "Seats 5 passengers", available: true },
        { icon: <Fuel className="text-muted-foreground" />, text: "Fuel policy: Full to Full", available: true }
      ],
      popular: true
    },
    {
      id: 3,
      name: "SUV Premium",
      price: "Rs4,685/day",
      features: [
        { icon: <Luggage className="text-muted-foreground" />, text: "3 large suitcases", available: true },
        { icon: <Users className="text-muted-foreground" />, text: "Seats 7 passengers", available: true },
        { icon: <Settings className="text-muted-foreground" />, text: "Automatic transmission", available: true }
      ],
      popular: false
    }
  ];

  const handleCarSelect = (carId: number) => {
    setSelectedCar(carId);
  };

  const handleProceedToBooking = () => {
    if (selectedCar) {
      setShowBookingSection(true);
    } else {
      alert("Please select a car option first");
    }
  };

  const handleGoBack = () => {
    setShowBookingSection(false);
  };

  const handleBookNow = (providerName: string) => {
    if (!selectedCar) return;
    const carDetails = carOptions.find(c => c.id === selectedCar);
    if (!carDetails) return;
    const state = {
      type: 'Car',
      title: carDetails.name,
      subtitle: 'Lahore (LHE) to Islamabad (ISB)',
      price: carDetails.price,
      options: [
        { label: 'Provider', value: providerName },
        { label: 'Duration', value: '3 Days' },
        { label: 'Dates', value: 'Fri. Apr 17 - Mon. Apr 20' }
      ]
    };
    sessionStorage.setItem('booking-details', JSON.stringify(state));
    router.push("/cars/payment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background p-4 md:p-6">
      <div className="container mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-primary-700 text-primary-foreground rounded-t-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-primary p-3 rounded-xl">
              <Car className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">CarRentals.pk</h1>
              <p className="text-primary-foreground/80 text-sm">Car Rental Booking System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-primary/50 p-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <Users className="text-primary-foreground/90" />
              <span className="font-medium">3 Days Rental</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="text-primary-foreground/90" />
              <span className="font-medium">Fri. Apr 17 - Mon. Apr 20</span>
            </div>
          </div>
        </header>

        {/* Car Rental Summary */}
        <div className="bg-background p-6 border-b border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Lahore to Islamabad</h2>
            <p className="text-muted-foreground">One-way • 3 Days Rental</p>
          </div>

          <div className="bg-primary/10 p-5 rounded-xl border border-primary/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">LHE → ISB</h3>
                <p className="text-muted-foreground">Fri. Apr 17 - Mon. Apr 20 • 3 Days</p>
              </div>
              <div className="mt-3 md:mt-0">
                <div className="inline-flex items-center px-4 py-2 bg-primary/20 text-primary rounded-full font-medium">
                  <Clock className="mr-2" />
                  Pick-up: 10:00 AM • Drop-off: 10:00 AM
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-foreground">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-background rounded-full border border-input mr-3">
                  <span className="font-bold text-primary">CR</span>
                </div>
                <div>
                  <p className="font-medium">CarRentals Express Service</p>
                  <p className="text-sm text-muted-foreground">Multiple car options available</p>
                </div>
              </div>
              <div className="hidden md:block border-l border-input h-8"></div>
              <div className="flex items-center">
                <MapPin className="text-primary mr-2" />
                <span>Pick-up: Lahore Airport (LHE)</span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-primary mr-2" />
                <span>Drop-off: Islamabad Airport (ISB)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-background border-b border-border">
          <div className="flex overflow-x-auto">
            <div className={`flex items-center px-8 py-5 ${!showBookingSection ? 'border-b-2 border-primary' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${!showBookingSection ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                1
              </div>
              <div>
                <h3 className={`font-bold ${!showBookingSection ? 'text-primary' : 'text-foreground'}`}>Choose a car</h3>
                <p className="text-sm text-muted-foreground">Select your preferred vehicle</p>
              </div>
            </div>

            <div className={`flex items-center px-8 py-5 ${showBookingSection ? 'border-b-2 border-primary' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${showBookingSection ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                2
              </div>
              <div>
                <h3 className={`font-bold ${showBookingSection ? 'text-primary' : 'text-foreground'}`}>Choose where to book</h3>
                <p className="text-sm text-muted-foreground">Complete your booking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-background rounded-b-2xl overflow-hidden shadow-lg">
          {!showBookingSection ? (
            <>
              {/* Car Selection Section */}
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold text-foreground mb-6">Step 1: Choose a car</h3>
                <p className="text-muted-foreground mb-8">
                  See baggage size and car specifications. Total prices may include estimated insurance fees and additional equipment.
                  Some options may require added insurance or equipment when checking out. Check terms and conditions on the booking site.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {carOptions.map((car) => (
                    <div
                      key={car.id}
                      className={`border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer hover:shadow-lg ${selectedCar === car.id ? 'border-primary bg-primary/10' : 'border-border'
                        } ${car.popular ? 'ring-2 ring-primary ring-opacity-30' : ''}`}
                      onClick={() => handleCarSelect(car.id)}
                    >
                      {car.popular && (
                        <div className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                          Most Popular
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-foreground">{car.name}</h4>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCar === car.id ? 'border-primary bg-primary' : 'border-input'
                          }`}>
                          {selectedCar === car.id && <Check className="text-primary-foreground text-xs" />}
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-foregroundnd mb-6">{car.price}</div>

                      <div className="space-y-4">
                        {car.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <div className="mt-1 mr-3">
                              {feature.icon}
                            </div>
                            <span className={`${feature.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleProceedToBooking}
                    disabled={!selectedCar}
                    className={`flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${selectedCar
                        ? 'bg-gradient-to-r from-primary to-primary-600 text-primary-foreground hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                  >
                    Proceed to Booking
                    <ArrowRight className="ml-3" />
                  </button>
                </div>
              </div>

              {/* Rental Details */}
              <div className="p-6 bg-muted">
                <h3 className="text-lg font-bold text-foreground mb-4">Rental Details</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center">
                    <Shield className="text-muted-foreground mr-3" />
                    <div>
                      <p className="font-medium">Insurance Policy</p>
                      <p className="text-sm text-muted-foreground">Basic insurance included</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Fuel className="text-muted-foreground mr-3" />
                    <div>
                      <p className="font-medium">Fuel Policy</p>
                      <p className="text-sm text-muted-foreground">Full to Full for all cars</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="text-muted-foreground mr-3" />
                    <div>
                      <p className="font-medium">Driver Requirements</p>
                      <p className="text-sm text-muted-foreground">Minimum age: 21 years</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Booking Section */
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-8">
                <button
                  onClick={handleGoBack}
                  className="flex items-center text-primary hover:text-primary mr-6"
                >
                  <ArrowRight className="rotate-180 mr-2" />
                  Back to cars
                </button>
                <h3 className="text-2xl font-bold text-foreground">Step 2: Choose where to book</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Selected Car Summary */}
                <div className="bg-muted p-6 rounded-2xl border border-border">
                  <h4 className="text-xl font-bold text-foreground mb-6">Your Selected Car</h4>

                  {selectedCar && (
                    <>
                      <div className="bg-background p-5 rounded-xl mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-lg font-bold text-foreground">
                            {carOptions.find(c => c.id === selectedCar)?.name}
                          </h5>
                          <div className="text-2xl font-bold text-foregroundnd">
                            {carOptions.find(c => c.id === selectedCar)?.price}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {carOptions.find(c => c.id === selectedCar)?.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <div className="mr-3">
                                {feature.available ? (
                                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                                    <Check className="text-success text-xs" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-muted-foreground text-xs">i</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-foreground">{feature.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-primary/10 p-5 rounded-xl">
                        <h5 className="font-bold text-foreground mb-3">Rental Summary</h5>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground">Lahore (LHE) → Islamabad (ISB)</span>
                          <span className="font-medium">3 Days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">CarRentals Express</span>
                          <span className="font-medium">One-way rental</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary/30">
                          <div className="flex items-center text-primary">
                            <Shield className="mr-2" />
                            <span className="text-sm">Free cancellation within 24 hours</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Booking Options */}
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-6">Available Booking Options</h4>

                  <div className="space-y-6">
                    {/* Option 1 */}
                    <div className="border-2 border-border rounded-xl p-6 hover:border-primary transition-all duration-200 cursor-pointer hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="text-lg font-bold text-foreground">CarRentals.pk Official</h5>
                          <p className="text-muted-foreground">Book directly with the provider</p>
                        </div>
                        <div className="text-2xl font-bold text-foregroundnd">
                          {selectedCar && carOptions.find(c => c.id === selectedCar)?.price}
                        </div>
                      </div>
                      <div className="flex items-center text-success font-medium mb-4">
                        <Check className="mr-2" />
                        Free cancellation within 24 hours
                      </div>
                      <button
                        onClick={() => handleBookNow('CarRentals.pk Official')}
                        className="w-full bg-gradient-to-r from-primary to-primary-700 text-primary-foreground font-bold py-4 rounded-xl hover:from-primary-600 hover:to-primary-800 transition-all duration-200"
                      >
                        {t("bookNow")}
                      </button>
                    </div>

                    {/* Option 2 */}
                    <div className="border-2 border-border rounded-xl p-6 hover:border-primary transition-all duration-200 cursor-pointer hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="text-lg font-bold text-foreground">TravelHub Car Rentals</h5>
                          <p className="text-muted-foreground">Trusted travel partner</p>
                        </div>
                        <div className="text-2xl font-bold text-foregroundnd">
                          {selectedCar && carOptions.find(c => c.id === selectedCar)?.price}
                        </div>
                      </div>
                      <div className="flex items-center text-success font-medium mb-4">
                        <Check className="mr-2" />
                        Earn bonus reward points
                      </div>
                      <button
                        onClick={() => handleBookNow('TravelHub Car Rentals')}
                        className="w-full bg-gradient-to-r from-primary to-primary-700 text-primary-foreground font-bold py-4 rounded-xl hover:from-primary-600 hover:to-primary-800 transition-all duration-200"
                      >
                        {t("bookNow")}
                      </button>
                    </div>

                    {/* Option 3 */}
                    <div className="border-2 border-border rounded-xl p-6 hover:border-primary transition-all duration-200 cursor-pointer hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="text-lg font-bold text-foreground">Mobile App Exclusive</h5>
                          <p className="text-muted-foreground">App-only discounts available</p>
                        </div>
                        <div className="text-2xl font-bold text-foregroundnd">
                          {selectedCar && carOptions.find(c => c.id === selectedCar)?.price}
                        </div>
                      </div>
                      <div className="flex items-center text-success font-medium mb-4">
                        <Check className="mr-2" />
                        Extra 10% off for app users
                      </div>
                      <button
                        onClick={() => handleBookNow('Mobile App Exclusive')}
                        className="w-full bg-gradient-to-r from-primary to-primary-700 text-primary-foreground font-bold py-4 rounded-xl hover:from-primary-600 hover:to-primary-800 transition-all duration-200"
                      >
                        {t("bookNow")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 p-5 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> Total prices may include estimated insurance fees and additional equipment.
                      Some options may require added insurance or equipment when checking out.
                      Check terms and conditions on the booking site.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default CarBooking;