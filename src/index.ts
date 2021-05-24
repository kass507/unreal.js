import { FileProvider } from "./fileprovider/FileProvider";
import { FGuid } from "./ue4/objects/core/misc/Guid";
//import axios from "axios";
import { Game } from "./ue4/versions/Game";
import { Default__Deluxe_UIData_C } from "./valorant/exports/Default__Deluxe_UIData_C";

(async () => {
    //const provider = new FileProvider("C:/Program Files/Epic Games/Fortnite/FortniteGame/Content/Paks")
    //const provider = new FileProvider("C:/Program Files/Epic Games/Fortnite/FortniteGame/Content/Paks")
    const provider = new FileProvider("C:\\Riot Games\\VALORANT\\live\\ShooterGame\\Content\\Paks", Game.GAME_VALORANT)
    provider.populateIoStoreFiles = true
    await provider.initialize()

    //const { data } = (await axios.get("https://fortnite-api.com/v2/aes")).data
    //await provider.submitKey(FGuid.mainGuid, data.mainKey)
    await provider.submitKey(FGuid.mainGuid, "0x4BE71AF2459CF83899EC9DC2CB60E22AC4B3047E0211034BBABE9D174C069DD6")

    //const pkg = provider.loadObject("FortniteGame/Content/Athena/Items/Cosmetics/Characters/CID_144_Athena_Commando_M_SoccerDudeA")
    //console.log(pkg)

    const pkg = provider.loadObject("ShooterGame/Content/Contracts/Characters/Wushu/WushuChapter1_DataAsset.Default__WushuChapter1_DataAsset_C")
    console.log(pkg.toJson())
})()
