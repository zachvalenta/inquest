import { EntityRepository, Repository, MoreThanOrEqual } from "typeorm";
import { Probe } from "../entities";
import { subMinutes } from "date-fns";

@EntityRepository(Probe)
export class ProbeRepository extends Repository<Probe> {
    /**
     * retrieves the list of active probes for the given tracestate
     */
    async findActiveProbesIds(traceStateId: number): Promise<number[]> {
        return (
            await this.find({
                select: ["id"],
                where: {
                    traceStateId: traceStateId,
                    lastHeartbeat: MoreThanOrEqual(subMinutes(new Date(), 5)),
                },
            })
        ).map((probe) => probe.id);
    }
}
