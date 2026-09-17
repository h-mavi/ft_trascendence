import { localBoard, localInfo } from "@/scripts/Data/Variables";

export function getTarget(fromId, toId)
{
    const	boostedZones = localBoard.get(fromId)?.boostedTargetZones?.get(fromId);
    const	fromP = localBoard.get(fromId).piece ? localBoard.get(fromId).piece : null;
	const	calledByBastard = localInfo.usingAbility === "Bastards";

    if (localBoard.get(fromId).useAbilityBool && boostedZones?.has(toId) &&
        !["Bastards","King","Minotaurus","Champion"].includes(fromP?.type))
        	return (boostedZones.has(toId));
    else if (["Minotaurus","Champion"].includes(fromP?.type) && localInfo.secondMove && localInfo.savedBoostedMap && !calledByBastard)
        return (localInfo.savedBoostedMap.has(toId));
    else
    {
        if (!calledByBastard && !["Bastards","King"].includes(fromP?.type) && localInfo.secondMove && !boostedZones?.has(toId))
            localInfo.usingAbility = "";
        return (localBoard.get(fromId).targetZones.has(toId));
    }
}
