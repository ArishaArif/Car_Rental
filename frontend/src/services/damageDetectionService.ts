import {
  CapturedPhoto,
  DamageFinding,
  DamageSeverity,
  DamageType,
  InspectionAnalysisResult,
  PhotoCategory,
} from '../types';
import { aiPricingApi } from '../api/aiPricingApi';

export interface DamageDetectionServiceInterface {
  analyzePhotos(
    bookingId: string,
    vehicleId: string,
    photos: CapturedPhoto[],
    presetScenario?: 'Clean' | 'MinorDamage' | 'ModerateDamage' | 'SevereDamage'
  ): Promise<InspectionAnalysisResult>;
  getDefaultPhotoTemplates(): Record<PhotoCategory, { title: string; hint: string; mockUri: string }>;
  generateMockAnalysis(
    bookingId: string,
    vehicleId: string,
    scenario: 'Clean' | 'MinorDamage' | 'ModerateDamage' | 'SevereDamage'
  ): InspectionAnalysisResult;
}

class DamageDetectionService implements DamageDetectionServiceInterface {
  /**
   * Default high-resolution mock vehicle reference images for the 6 required photo categories
   */
  public getDefaultPhotoTemplates(): Record<PhotoCategory, { title: string; hint: string; mockUri: string }> {
    return {
      Front: {
        title: 'Front Bumper & Headlights',
        hint: 'Capture full front grill, bumper, hood, and headlight lenses.',
        mockUri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
      },
      Rear: {
        title: 'Rear Bumper & Trunk',
        hint: 'Capture entire rear fender, taillights, and boot lid.',
        mockUri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800',
      },
      Left: {
        title: 'Left Driver Side Panel',
        hint: 'Align front & rear doors, side mirrors, and wheel arches.',
        mockUri: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800',
      },
      Right: {
        title: 'Right Passenger Side Panel',
        hint: 'Capture passenger side doors, quarter panel, and skirts.',
        mockUri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800',
      },
      Interior: {
        title: 'Interior Cabin & Upholstery',
        hint: 'Ensure seats, floor mats, and steering column are clearly visible.',
        mockUri: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800',
      },
      Dashboard: {
        title: 'Dashboard & Gauge Cluster',
        hint: 'Take clear view of instrument cluster, screen, and gear shift.',
        mockUri: 'https://images.unsplash.com/photo-1590362891988-f77804703088?q=80&w=800',
      },
    };
  }

  /**
   * Prototype AI Computer Vision analysis simulation with live backend endpoint integration
   */
  public async analyzePhotos(
    bookingId: string,
    vehicleId: string,
    photos: CapturedPhoto[],
    presetScenario: 'Clean' | 'MinorDamage' | 'ModerateDamage' | 'SevereDamage' = 'MinorDamage'
  ): Promise<InspectionAnalysisResult> {
    try {
      const photoMap: Record<string, string> = {};
      photos.forEach(p => {
        photoMap[p.category.toLowerCase()] = p.uri || 'https://images.unsplash.com/photo-1617788138017-80ad40651399';
      });

      const res = await aiPricingApi.analyzeDamagePhotos({
        vehicle_id: vehicleId,
        booking_id: bookingId,
        photos: photoMap,
      });

      if (res.success && res.data) {
        const live = res.data;
        const findings: DamageFinding[] = (live.findings || []).map((f: any, idx: number) => {
          let cat: PhotoCategory = 'Front';
          const angleLower = (f.angle || '').toLowerCase();
          if (angleLower.includes('rear') || angleLower.includes('back')) cat = 'Rear';
          else if (angleLower.includes('left')) cat = 'Left';
          else if (angleLower.includes('right')) cat = 'Right';
          else if (angleLower.includes('interior')) cat = 'Interior';
          else if (angleLower.includes('dash')) cat = 'Dashboard';

          let dtype: DamageType = 'Scratch';
          const dtLower = (f.damage_type || '').toLowerCase();
          if (dtLower.includes('no damage') || dtLower.includes('clean') || dtLower.includes('none')) dtype = 'No Damage';
          else if (dtLower.includes('dent')) dtype = 'Dent';
          else if (dtLower.includes('crack') || dtLower.includes('glass')) dtype = 'Glass Crack';

          let sev: DamageSeverity = 'Minor';
          const sevLower = (f.severity || '').toLowerCase();
          if (sevLower.includes('none') || sevLower.includes('clean')) sev = 'None';
          else if (sevLower.includes('moderate')) sev = 'Moderate';
          else if (sevLower.includes('severe')) sev = 'Severe';

          return {
            id: `find-live-${idx + 1}`,
            category: cat,
            damageType: dtype,
            severity: sev,
            location: f.location_on_panel || f.location || `${cat} Panel`,
            confidence: typeof f.confidence === 'number' ? f.confidence : 0.92,
            estimatedRepairCost: Number(f.repair_estimate || f.estimatedRepairCost || 0),
            evidenceImageUrl: photoMap[cat.toLowerCase()] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
            notes: f.notes || `${dtype} detected on ${cat} section.`,
          };
        });

        let cond: 'Passed - No Damage' | 'Needs Minor Repair' | 'Requires Provider Attention' = 'Passed - No Damage';
        const allowedConds = ['Passed - No Damage', 'Needs Minor Repair', 'Requires Provider Attention'];
        if (allowedConds.includes(live.overall_condition)) {
          cond = live.overall_condition as any;
        } else if (live.total_estimated_cost > 10000) {
          cond = 'Requires Provider Attention';
        } else if (live.total_estimated_cost > 0 || findings.some(f => f.damageType !== 'No Damage')) {
          cond = 'Needs Minor Repair';
        }

        return {
          inspectionId: live.inspection_id || `insp-ai-${Date.now().toString().slice(-6)}`,
          vehicleId: live.vehicle_id || vehicleId,
          bookingId,
          analyzedAt: live.analyzed_at || new Date().toISOString(),
          findings,
          totalEstimatedCost: Number(live.total_estimated_cost || 0),
          overallCondition: cond,
          disclaimer: live.disclaimer || 'Velox Vision Neural Inspection Engine verified.',
        };
      }
    } catch (e: any) {
      console.warn('[DamageDetectionService] Live CV analysis fallback to simulation:', e?.message);
    }

    // Realistic AI scanning pipeline delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
    return this.generateMockAnalysis(bookingId, vehicleId, presetScenario);
  }

  /**
   * Generates deterministic inspection results for test scenarios
   */
  public generateMockAnalysis(
    bookingId: string,
    vehicleId: string,
    scenario: 'Clean' | 'MinorDamage' | 'ModerateDamage' | 'SevereDamage'
  ): InspectionAnalysisResult {
    const inspectionId = `insp-ai-${Date.now().toString().slice(-6)}`;
    const analyzedAt = new Date().toISOString();
    const disclaimer =
      'PROTOTYPE SIMULATION NOTICE: This AI Damage Detection is a client-side prototype demonstration utilizing simulated computer vision algorithms. No real-world CV or cloud inference is executed.';

    switch (scenario) {
      case 'Clean':
        return {
          inspectionId,
          vehicleId,
          bookingId,
          analyzedAt,
          findings: [
            {
              id: 'find-1',
              category: 'Front',
              damageType: 'No Damage',
              severity: 'None',
              location: 'Front Bumper & Grille',
              confidence: 0.98,
              estimatedRepairCost: 0,
              evidenceImageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
              notes: 'Clean surface detected. No scratches or structural anomalies.',
            },
            {
              id: 'find-2',
              category: 'Right',
              damageType: 'No Damage',
              severity: 'None',
              location: 'Right Quarter Panel',
              confidence: 0.96,
              estimatedRepairCost: 0,
              evidenceImageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800',
              notes: 'Paint reflection consistent with certified return standards.',
            },
          ],
          totalEstimatedCost: 0,
          overallCondition: 'Passed - No Damage',
          disclaimer,
        };

      case 'ModerateDamage':
        return {
          inspectionId,
          vehicleId,
          bookingId,
          analyzedAt,
          findings: [
            {
              id: 'find-mod-1',
              category: 'Left',
              damageType: 'Dent',
              severity: 'Moderate',
              location: 'Driver Rear Door Panel',
              confidence: 0.91,
              estimatedRepairCost: 8500,
              evidenceImageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800',
              notes: 'Concave surface deformation (approx. 7cm depth) detected on left lower door crease.',
            },
            {
              id: 'find-mod-2',
              category: 'Front',
              damageType: 'Scratch',
              severity: 'Minor',
              location: 'Lower Front Lip Spoilers',
              confidence: 0.88,
              estimatedRepairCost: 2500,
              evidenceImageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
              notes: 'Abrasive curb scrape extending 12cm across lower valance.',
            },
          ],
          totalEstimatedCost: 11000,
          overallCondition: 'Requires Provider Attention',
          disclaimer,
        };

      case 'SevereDamage':
        return {
          inspectionId,
          vehicleId,
          bookingId,
          analyzedAt,
          findings: [
            {
              id: 'find-sev-1',
              category: 'Front',
              damageType: 'Glass Crack',
              severity: 'Severe',
              location: 'Windshield Driver Viewport',
              confidence: 0.95,
              estimatedRepairCost: 18000,
              evidenceImageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
              notes: 'Spiderweb stress fracture radiating from lower wiper anchor point. Safety hazard.',
            },
            {
              id: 'find-sev-2',
              category: 'Rear',
              damageType: 'Dent',
              severity: 'Moderate',
              location: 'Rear Bumper Impact Zone',
              confidence: 0.89,
              estimatedRepairCost: 7500,
              evidenceImageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800',
              notes: 'Reverse parking compression damage with broken bracket clip.',
            },
          ],
          totalEstimatedCost: 25500,
          overallCondition: 'Requires Provider Attention',
          disclaimer,
        };

      case 'MinorDamage':
      default:
        return {
          inspectionId,
          vehicleId,
          bookingId,
          analyzedAt,
          findings: [
            {
              id: 'find-min-1',
              category: 'Left',
              damageType: 'Scratch',
              severity: 'Minor',
              location: 'Left Front Fender & Door Edge',
              confidence: 0.93,
              estimatedRepairCost: 3500,
              evidenceImageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800',
              notes: 'Clearcoat surface abrasion detected (5cm). Paint-touchup and buffing recommended.',
            },
          ],
          totalEstimatedCost: 3500,
          overallCondition: 'Needs Minor Repair',
          disclaimer,
        };
    }
  }
}

export const damageDetectionService = new DamageDetectionService();
