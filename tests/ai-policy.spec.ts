import {test,expect} from '@playwright/test';
import {passesObviousClaimCheck} from '../app/api/discover-skills/policy';
test('professional qualities are allowed while concrete unsupported claims are withheld',()=>{
 expect(passesObviousClaimCheck('Reliable worker maintaining clean, orderly spaces','I cleaned rooms and changed linens.')).toBe(true);
 expect(passesObviousClaimCheck('Full-time childcare','I cared for my child at home.')).toBe(false);
 expect(passesObviousClaimCheck('Fluent in English and Spanish','I speak English and Spanish.')).toBe(false);
 expect(passesObviousClaimCheck('Reliable volunteer','I organized donated shoes.')).toBe(false);
 expect(passesObviousClaimCheck('Reliable volunteer','I volunteered sorting clothes.')).toBe(true);
 expect(passesObviousClaimCheck('Certified forklift operator','I am not certified.')).toBe(false);
 expect(passesObviousClaimCheck('Improved productivity by 50%','I cleaned rooms.')).toBe(false);
 expect(passesObviousClaimCheck('Event setup and cleanup','I helped stack chairs after a school event.')).toBe(false);
});
