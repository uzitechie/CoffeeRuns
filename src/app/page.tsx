"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSession, logoutUser, type SessionUser } from "@/lib/auth-api";

type Product = {
  id: string;
  name: string;
  nameSv: string;
  description: string;
  descriptionSv: string;
  category: "coffee" | "fika" | "office";
  price: number;
  image: string;
};

const products: Product[] = [
  {
    id: "latte",
    name: "Cinnamon Latte",
    nameSv: "Kanel Latte",
    description: "Double espresso, steamed oat milk and cinnamon foam.",
    descriptionSv: "Dubbel espresso, havremjolk och kanelskum.",
    category: "coffee",
    price: 59,
    image: "/assets/coffee-product-1.png",
  },
  {
    id: "fika-box",
    name: "Fika Box",
    nameSv: "Fikalada",
    description: "Mini buns, cardamom cookies and seasonal pastries.",
    descriptionSv: "Minibullar, kardemummakakor och sasongsbakelser.",
    category: "fika",
    price: 149,
    image: "/assets/coffee-product-2.png",
  },
  {
    id: "office-pack",
    name: "Office Brew Pack",
    nameSv: "Kontorspaket",
    description: "Beans, filters and milk for productive meeting days.",
    descriptionSv: "Bonor, filter och mjolk for produktiva motesdagar.",
    category: "office",
    price: 299,
    image: "/assets/coffee-hero.png",
  },
];

const deliveryOptions = [
  { key: "city", label: "Stockholm city", labelSv: "Stockholm stad", fee: 49 },
  { key: "suburb", label: "Greater Stockholm", labelSv: "Storstockholm", fee: 79 },
];

const paymentOptions = [
  { key: "klarna", label: "Klarna" },
  { key: "swish", label: "Swish" },
  { key: "cod", label: "Cash on delivery" },
];

const sek = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" });

export default function Home() {
  const [isSwedish, setIsSwedish] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [savedLocation, setSavedLocation] = useState("");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [category, setCategory] = useState<"all" | Product["category"]>("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [delivery, setDelivery] = useState(deliveryOptions[0].key);
  const [payment, setPayment] = useState(paymentOptions[0].key);

  useEffect(() => {
    const stored = window.localStorage.getItem("coffee-runs-location");
    if (stored) {
      setLocation(stored);
      setSavedLocation(stored);
    }

    getSession()
      .then((session) => setUser(session.user))
      .catch(() => setAuthError("Authentication service is unavailable."));
  }, []);

  const isLoggedIn = Boolean(user);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return [item.name, item.nameSv, item.description, item.descriptionSv].some((text) =>
        text.toLowerCase().includes(q),
      );
    });
  }, [category, search]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({
          item: products.find((p) => p.id === id),
          qty,
        }))
        .filter((entry): entry is { item: Product; qty: number } => Boolean(entry.item)),
    [cart],
  );

  const cartCount = cartItems.reduce((total, entry) => total + entry.qty, 0);
  const subtotal = cartItems.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);
  const selectedDelivery = deliveryOptions.find((option) => option.key === delivery) ?? deliveryOptions[0];
  const total = subtotal + (cartCount > 0 ? selectedDelivery.fee : 0);

  function setCartQuantity(productId: string, nextQty: number) {
    setCart((prev) => {
      if (nextQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [productId]: nextQty,
      };
    });
  }

  const labels = isSwedish
    ? {
        login: "Logga in",
        signup: "Skapa konto",
        logout: "Logga ut",
        title: "Kaffe, fika och kontorsboxar till din adress.",
        subtitle:
          "Från första teamavstämningen till dagens sista möte, gör kaffelöpningen till den enklaste delen av att samlas.",
        primaryCta: "Plan a coffee run",
        secondaryCta: "Coffee for teams",
        supportingLine: "Less time coordinating coffee. More time connecting over it.",
        address: "Lagg till leveransadress",
        save: "Spara",
        search: "Sok kaffe, fika, kontorspaket...",
        all: "Alla",
        coffee: "Kaffe",
        fika: "Fika",
        office: "Kontor",
        add: "Lagg till",
        remove: "Ta bort",
        decrease: "Minska",
        clearCart: "Rensa varukorg",
        cart: "Varukorg",
        checkout: "Leverans och betalning",
        empty: "Lagg till produkter for att se leverans- och betalningsalternativ.",
        delivery: "Leverans",
        payment: "Betalning",
        name: "Namn",
        email: "E-post",
        phone: "Mobil (for Swish)",
        note: "Leveransanteckning",
        place: "Slutfor bestallning",
        subtotal: "Delsumma",
        deliveryFee: "Leveransavgift",
        total: "Totalt",
      }
    : {
        login: "Login",
        signup: "Sign Up",
        logout: "Logout",
        title: "Coffee for the moments that move work forward.",
        subtitle:
          "From the first team catch-up to the last meeting of the day, make the coffee run the easiest part of getting together.",
        primaryCta: "Plan a coffee run",
        secondaryCta: "Coffee for teams",
        supportingLine: "Less time coordinating coffee. More time connecting over it.",
        address: "Add delivery address",
        save: "Save",
        search: "Search coffee, fika, office boxes...",
        all: "All",
        coffee: "Coffee",
        fika: "Fika",
        office: "Office",
        add: "Add",
        remove: "Remove",
        decrease: "Decrease",
        clearCart: "Clear cart",
        cart: "Cart",
        checkout: "Delivery and payment",
        empty: "Add items to view delivery and payment options.",
        delivery: "Delivery",
        payment: "Payment",
        name: "Name",
        email: "Email",
        phone: "Mobile (for Swish)",
        note: "Delivery note",
        place: "Place order",
        subtotal: "Subtotal",
        deliveryFee: "Delivery fee",
        total: "Total",
      };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f2e6_0%,_#fff_45%)]">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <Link href="/login" className={`${buttonVariants({ variant: "outline" })} glass-menu`}>
                  {labels.login}
                </Link>
                <Link href="/signup" className={`${buttonVariants()} glass-menu glass-menu-active`}>
                  {labels.signup}
                </Link>
              </>
            ) : (
              <>
                <Badge className="rounded-full px-3 py-1 text-sm">{user?.username}</Badge>
                <Button
                  variant="outline"
                  className="glass-menu"
                  onClick={async () => {
                    setAuthError("");
                    try {
                      await logoutUser();
                      setUser(null);
                    } catch (error) {
                      setAuthError(error instanceof Error ? error.message : "Logout failed.");
                    }
                  }}
                >
                  {labels.logout}
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Image src="/assets/cr-logo.png" alt="Coffee Runs logo" width={40} height={40} />
            <div>
              <p className="text-lg font-semibold leading-none">Coffee Runs</p>
              <p className="text-xs text-muted-foreground">Swedish coffee delivery</p>
            </div>
          </div>

          <div className="flex min-w-72 items-center gap-2">
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder={labels.address}
              aria-label={labels.address}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setSavedLocation(location);
                window.localStorage.setItem("coffee-runs-location", location);
              }}
            >
              {labels.save}
            </Button>
          </div>
        </div>
      </header>
      {authError ? <p className="mx-auto mt-3 w-full max-w-7xl px-6 text-sm text-red-600">{authError}</p> : null}

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 md:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1.2fr_.8fr]">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-stone-900">{labels.title}</h1>
                <p className="text-stone-600">{labels.subtitle}</p>
                <div className="flex flex-wrap gap-2">
                  <Button>{labels.primaryCta}</Button>
                  <Button variant="outline">{labels.secondaryCta}</Button>
                </div>
                <p className="text-sm text-stone-500">{labels.supportingLine}</p>
                {savedLocation && (
                  <p className="text-sm text-stone-500">
                    {isSwedish ? "Sparad adress:" : "Saved address:"} {savedLocation}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={category === "all" ? "default" : "outline"}
                    className={category === "all" ? "glass-menu glass-menu-active" : "glass-menu"}
                    onClick={() => setCategory("all")}
                  >
                    {labels.all}
                  </Button>
                  <Button
                    variant={category === "coffee" ? "default" : "outline"}
                    className={category === "coffee" ? "glass-menu glass-menu-active" : "glass-menu"}
                    onClick={() => setCategory("coffee")}
                  >
                    {labels.coffee}
                  </Button>
                  <Button
                    variant={category === "fika" ? "default" : "outline"}
                    className={category === "fika" ? "glass-menu glass-menu-active" : "glass-menu"}
                    onClick={() => setCategory("fika")}
                  >
                    {labels.fika}
                  </Button>
                  <Button
                    variant={category === "office" ? "default" : "outline"}
                    className={category === "office" ? "glass-menu glass-menu-active" : "glass-menu"}
                    onClick={() => setCategory("office")}
                  >
                    {labels.office}
                  </Button>
                </div>
              </div>
              <Image
                src="/assets/coffee-hero.png"
                alt="Coffee hero"
                width={540}
                height={380}
                className="h-56 w-full rounded-xl object-cover"
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={labels.search}
              className="max-w-md bg-white"
              aria-label={labels.search}
            />
            <Button variant="outline" className="glass-menu" onClick={() => setIsSwedish((value) => !value)}>
              {isSwedish ? "English" : "Svenska"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredProducts.map((item) => {
              const isFavorite = Boolean(favorites[item.id]);
              return (
                <Card key={item.id}>
                  <CardHeader>
                    <Image
                      src={item.image}
                      alt={isSwedish ? item.nameSv : item.name}
                      width={520}
                      height={320}
                      className="h-40 w-full rounded-md object-cover"
                    />
                    <CardTitle className="mt-3 text-xl">{isSwedish ? item.nameSv : item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {isSwedish ? item.descriptionSv : item.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{sek.format(item.price)}</Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={!isLoggedIn}
                        onClick={() =>
                          setFavorites((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }))
                        }
                      >
                        {isFavorite ? "♥" : "♡"}
                      </Button>
                      <Button
                        onClick={() =>
                          setCartQuantity(item.id, (cart[item.id] ?? 0) + 1)
                        }
                      >
                        {labels.add}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {labels.cart} <Badge>{cartCount}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.empty}</p>
              ) : (
                <>
                  {cartItems.map(({ item, qty }) => (
                    <div key={item.id} className="space-y-2 rounded-md border p-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>
                          {isSwedish ? item.nameSv : item.name} x {qty}
                        </span>
                        <strong>{sek.format(item.price * qty)}</strong>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCartQuantity(item.id, qty - 1)}
                        >
                          {labels.decrease}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCartQuantity(item.id, 0)}
                        >
                          {labels.remove}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => setCart({})}>
                    {labels.clearCart}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {cartCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{labels.checkout}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{labels.delivery}</label>
                  <Select value={delivery} onValueChange={(value) => value && setDelivery(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {(isSwedish ? option.labelSv : option.label)} ({sek.format(option.fee)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{labels.payment}</label>
                  <Select value={payment} onValueChange={(value) => value && setPayment(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input placeholder={labels.name} />
                <Input type="email" placeholder={labels.email} />
                <Input placeholder={labels.phone} />
                <Textarea placeholder={labels.note} rows={3} />

                <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span>{labels.subtotal}</span>
                    <span>{sek.format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{labels.deliveryFee}</span>
                    <span>{sek.format(selectedDelivery.fee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{labels.total}</span>
                    <span>{sek.format(total)}</span>
                  </div>
                </div>
                <Button className="w-full">{labels.place}</Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </main>

      <footer className="border-t bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground">
          <p>© Coffee Runs</p>
          <div className="flex items-center gap-4">
            <span className="font-medium text-foreground">Company</span>
            <Link href="/about" className="glass-menu px-3 py-1.5 text-sm">
              About us
            </Link>
            <Link href="/contact" className="glass-menu px-3 py-1.5 text-sm">
              Contact us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
