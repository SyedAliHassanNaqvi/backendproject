import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  assignTaskToOfficial
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/assign-task/:id", assignTaskToOfficial);

export default router;
