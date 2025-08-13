import { motion } from 'framer-motion'
import BuildingFloorPlan from '../components/ui/BuildingFloorPlan'
import SEO from '../components/common/SEO'
import { pageVariants, pageTransition } from '../utils/animations'

const BuildingPlan = () => {
  return (
    <>
      <SEO 
        title="Етажни планове - KSM Stroy"
        description="Интерактивни етажни планове на нашите жилищни сгради. Разгледайте наличните апартаменти и гаражи."
        keywords="етажни планове, апартаменти, гаражи, жилища, софия"
        ogTitle="Етажни планове - KSM Stroy"
      />
      
      <motion.div 
        className="min-h-screen"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <BuildingFloorPlan />
      </motion.div>
    </>
  )
}

export default BuildingPlan