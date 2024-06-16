import { updatable } from "../../cocosExtend/Updatable";
import { ChanglefangOverall } from "../../net/Protocol";

export module CasinoData {
    export let info = updatable<ChanglefangOverall>(null);
}