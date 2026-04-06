import Image from 'next/image'

export const LogoSection = () => {
  return (
    <div className="flex items-center w-[250px] pl-10">
      <Image
        src="/yw-logo-white.png"
        alt="Yancey Works"
        width={115}
        height={40}
        className=""
      />
    </div>
  )
}
