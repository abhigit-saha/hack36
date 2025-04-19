import { Router } from "express";

const router = Router();

router.post("/login",LoginDoctor);


router.post("/prescribe", prescribeExerciseVideos);

router.get("/reports/pre-diagnosis", getPatientPreDiagnosisReports);

export default router;
