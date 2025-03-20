import { atom, useAtom } from "jotai"

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export interface AudioTrack {
  id: string;
  src: string;
  start?: number;
  end?: number;
}

export interface FragmentData {
  id: string;
  image: string;
  text: string;
  captions: string;
  durationInFrames: number;
  audio?: AudioTrack;
}

type GeneratorStore = {
  selected?: FragmentData["id"],
  fragments: FragmentData[]
}

const initFragments = [

] as GeneratorStore["fragments"]

const storeAtom = atom<GeneratorStore>({
  selected: undefined,
  fragments: initFragments
})

export function useGeneratorService() {
  const [store, setStore] = useAtom(storeAtom)

  const select = (item: GeneratorStore["fragments"][0]) => {
    setStore(store => {
      const isSame = store.selected === item.id
      return {
        ...store,
        selected: isSame ? undefined : item.id,
      }
    }
    )
  }

  const add = (item: GeneratorStore["fragments"][0]) => {
    setStore(store => {
      return {
        ...store,
        fragments: [...store.fragments, item]
      }
    }
    )
  }


  const remove = (itemId: GeneratorStore["fragments"][0]["id"]) => {
    setStore(store => {
      return {
        ...store,
        fragments: store.fragments.filter((item) => item.id !== itemId)
      }
    }
    )
  }

  const move = (
    sourceId: GeneratorStore["fragments"][0]["id"],
    targetId: GeneratorStore["fragments"][0]["id"]
  ) => {
    setStore((store) => {
      if (sourceId === targetId) {
        return store;
      }

      const newItems = [...store.fragments];

      const sourceIndex = newItems.findIndex((item) => item.id === sourceId);
      const targetIndex = newItems.findIndex((item) => item.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        console.error("Элементы с указанными id не найдены");
        return store;
      }

      // Меняем элементы местами
      const [removed] = newItems.splice(sourceIndex, 1); // Удаляем source элемент
      newItems.splice(targetIndex, 0, removed); // Вставляем его на место target

      return {
        ...store,
        fragments: newItems,
      };
    });
  };

  return {
    selected: store.selected,
    fragments: store.fragments,
    select,
    add,
    remove,
    move
  }
}
