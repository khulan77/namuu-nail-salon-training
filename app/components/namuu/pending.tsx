/**
 * Клиентээс хараахан ирээгүй мэдээлэл (хаяг, утас г.м). Зохиомол утга
 * бичихийн оронд энэ тэмдэглэгээг харуулна.
 */
export function Pending({ children = "Мэдээлэл оруулна" }: { children?: React.ReactNode }) {
  return <span className="italic text-muted">{children}</span>;
}

/** Жишээ (баталгаажаагүй) агуулгын шошго. */
export function DemoTag({ children = "Жишээ" }: { children?: React.ReactNode }) {
  return <span className="demo-tag">{children}</span>;
}
