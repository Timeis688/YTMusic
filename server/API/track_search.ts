import { APIRouter } from "../server";
import { searchYoutube } from "../sound/YouTube";
import { SoundProviders } from "../struct";

APIRouter.create(
  "track_search",
  "POST",
  async (req) => {
    const { term, provider } = req.body;
    if (typeof term !== "string") return { err: true, message: "Invalid search term." };

    switch (provider as SoundProviders) {
      case SoundProviders.YouTube:
        return { err: false, list: await searchYoutube(term) };
      default:
        return { err: true, message: "Invalid sound provider." };
    }
  },
  true
);
