import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("menu", "routes/menu.tsx"),
  route("about", "routes/about.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("orders", "routes/orders.tsx"),
  route("api/send-email", "routes/api.send-email.ts"),
] satisfies RouteConfig;
